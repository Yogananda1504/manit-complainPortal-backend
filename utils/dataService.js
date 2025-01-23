/**
 * @file Data Service module for handling LDAP and complaint data.
 * @module utils/DataService
*/
import HostelComplaint from "../models/HostelComplaint.js";
import AcademicComplaint from "../models/AcademicComplaint.js";
import AdministrationComplaint from "../models/AdministrationComplaint.js";
import InfrastructureComplaint from "../models/InfrastructureComplaint.js";
import MedicalComplaint from "../models/MedicalComplaint.js";
import RaggingComplaint from "../models/RaggingComplaint.js";
import appError from "./appError.js";
import validator from "validator";
import dotenv from "dotenv";
import ldap from "ldapjs";
import mongoose from "mongoose";

dotenv.config();

/**
 * Class representing a data service for handling LDAP and complaint data.
 */
class DataService {
    /**
     * Create a data service.
     */
    constructor() 
    {
    }

    /**
     * Bind a new LDAP client.
     * @returns {Promise<ldap.Client>} - A promise that resolves to a bound LDAP client.
     */
    async bindClient() {
        const client = ldap.createClient({
            url:  "ldap://localhost:389", //Used the Dynamic IP Address of the WSL instance as the LDAP is initialized in the WSL . Use the deployed version 
            tlsOptions: { rejectUnauthorized: false }
        });
        
        const bindDn = process.env.LDAP_BIND_DN || "cn=admin,dc=dev,dc=com";
        const bindPassword = process.env.LDAP_BIND_PASSWORD || "yoga";

        return new Promise((resolve, reject) => {
            client.bind(bindDn, bindPassword, (err) => {
                if (err) {
                    console.error("LDAP bind failed!", err);
                    return reject(new appError("LDAP authentication failed!", 500));
                }
                resolve(client);
            });
        });
    }

    /**
     * Transform LDAP attributes to a user object.
     * @param {Array} attributes - The LDAP attributes.
     * @returns {Object} - The transformed user object.
     */
    transformAttributes(attributes) {
        // Build index map in single pass
        const attrMap = attributes.reduce((map, attr) => {
            map[attr.type] = attr.values[0];
            return map;
        }, {});

        // Direct property access
        return {
            email: attrMap.mail,
            mobile: attrMap.mobile,
            uid: attrMap.uid,
            name: attrMap.cn,
            lastName: attrMap.sn,
            department: attrMap.departmentNumber,
            room: attrMap.roomNumber,
            hostel: attrMap.roomNumber?.split("-")[0],
            stream: attrMap.ou,
            postalAddress:attrMap.postalAddress,
            role: "student"
        };
    }

    /**
     * Search the LDAP for a user by scholar number.
     * @param {string} scholarNumber - The scholar number to search for.
     * @returns {Promise<Object>} - A promise that resolves to the user data.
     */
    async searchLDAP(scholarNumber) {
        const client = await this.bindClient();

        return new Promise((resolve, reject) => {
            const opts = {
                filter: `(uid=${scholarNumber})`,
                scope: "sub",
                attributes: [
                    "cn",
                    "sn",
                    "uid",
                    "mail",
                    "mobile",
                    "roomNumber",
                    "departmentNumber",
                    "ou",
                    "postalAddress"
                ],
            };

            client.search(
                "ou=Students,dc=dev,dc=com",
                opts,
                (err, searchRes) => {
                    if (err) {
                        console.error("Search error:", err);
                        client.unbind();
                        return reject(new appError("Error searching for user data!", 500));
                    }

                    let userData = null;

                    searchRes.on("searchEntry", (entry) => {
                        const attributes = entry.pojo.attributes;
                        console.log("Attributes:", attributes);
                        userData = this.transformAttributes(attributes);
                        console.log("Formatted User:", userData);
                    });

                    searchRes.on("end", (result) => {
                        client.unbind();

                        if (result.status !== 0 || !userData) {
                            return reject(new appError("User not found!", 404));
                        }

                        resolve(userData);
                    });

                    searchRes.on("error", (error) => {
                        console.error("Search error:", error);
                        client.unbind();
                        reject(new appError("Error occurred during LDAP search!", 500));
                    });
                }
            );
        });
    }

    /**
     * Get generic details of a user by username.
     * @param {string} username - The username to get details for.
     * @returns {Promise<Object>} - A promise that resolves to the user data.
     */
    async getGenericDetails(username) {
        const scholarNumber = validator.escape(username);
        return this.searchLDAP(scholarNumber);
    }

    /**
     * Ensure MongoDB connection.
     */
    async ensureMongoConnected() {
        if (mongoose.connection.readyState !== 1) {
            await mongoose.connect(process.env.MONGO_URI );
        }
    }

    /**
     * Get complaint details of a user by scholar number.
     * @param {string} scholarNumber - The scholar number to get complaint details for.
     * @returns {Promise<Object>} - A promise that resolves to the complaint details.
     */
    async getComplaintDetails(scholarNumber) {
        await this.ensureMongoConnected();
        try {
           const [
            hostelComplaints,
            academicConplaints,
            administrationComplaints,
            infrastructureComplaints,
            medicalComplaints,
            raggingComplaints
           ] = await Promise.all([
            HostelComplaint.find({scholarNumber}),
            AcademicComplaint.find({scholarNumber}),
            AdministrationComplaint.find({scholarNumber}),
            InfrastructureComplaint.find({scholarNumber}),
            MedicalComplaint.find({scholarNumber}),
            RaggingComplaint.find({scholarNumber})
            ]);

            //Combine all the complaints 
            const complaints = [
                ...hostelComplaints,
                ...academicConplaints,
                ...administrationComplaints,
                ...infrastructureComplaints,
                ...medicalComplaints,
                ...raggingComplaints
            ];

            
            const resolvedComplaints = complaints.filter(
                complaint => complaint.status === "Resolved"
            ).length;
    
            const unresolvedComplaints = complaints.filter(
                complaint => complaint.status !== "Resolved"
            ).length;
    
            return {
                registered: complaints.length,
                resolved: resolvedComplaints,
                unresolved: unresolvedComplaints,
                hostel:hostelComplaints.length,
                academic:academicConplaints.length,
                administration:administrationComplaints.length,
                infrastructure:infrastructureComplaints.length,
                medical:medicalComplaints.length,
                ragging:raggingComplaints.length
            };
        } catch (error) {
            console.error("Error fetching complaints:", error);
            throw new appError("Error fetching complaints data!", 500);
        }
    }

    /**
     * Get user profile details by username.
     * @param {string} username - The username to get profile details for.
     * @returns {Promise<Object>} - A promise that resolves to the user profile details.
     */
    async getUserProfileDetails(username) {
        try {
            const scholarNumber = validator.escape(username);
            const userData = await this.getGenericDetails(scholarNumber);
            const complaintDetails = await this.getComplaintDetails(scholarNumber);
            return {
                ...userData,
                ...complaintDetails
            };
        } catch (error) {
            throw error;
        }
    }
}

export default DataService;