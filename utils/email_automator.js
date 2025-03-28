// run `node index.js` in the terminal

import { email_logger as logger } from "./logger.js";
import transporter from "./transporter.js";
import Queue from "bull";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Validate required environment variables
if (
	!process.env.REDIS_HOST ||
	!process.env.REDIS_PORT ||
	!process.env.EMAIL_USER
) {
	logger.error(
		"Missing required environment variables for Redis or Email configuration."
	);
	process.exit(1); // Exit if configuration is incomplete
}

// Enhanced configuration with improved styling options
const CONFIG = {
	mimeTypes: {
		".jpg": "image/jpeg",
		".jpeg": "image/jpeg",
		".png": "image/png",
		".pdf": "application/pdf",
		".doc": "application/msword",
		".docx":
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		".xls": "application/vnd.ms-excel",
		".xlsx":
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		".txt": "text/plain",
		".zip": "application/zip",
	},
	colors: {
		primary: "#1e40af", // Deeper blue
		secondary: "#dc2626", // Vibrant red
		success: "#15803d", // Rich green
		warning: "#f59e0b", // Warm amber
		text: "#1f2937", // Dark gray
		lightText: "#6b7280", // Medium gray
		border: "#e5e7eb", // Light gray
		background: "#f8fafc", // Very light blue-gray
		cardBg: "#ffffff",
		gradientStart: "#1e40af",
		gradientEnd: "#3b82f6",
	},
	fonts: {
		primary: "'Segoe UI', system-ui, sans-serif",
		heading: "'Arial', 'Helvetica Neue', sans-serif",
	},
	spacing: {
		xs: "8px",
		sm: "12px",
		md: "16px",
		lg: "24px",
		xl: "32px",
	},
};

// Initialize email queue with retry logic
const emailQueue = new Queue("emailQueue", {
	redis: {
		host: process.env.REDIS_HOST,
		port: process.env.REDIS_PORT,
		password: process.env.REDIS_PASSWORD,
		maxRetriesPerRequest: null, // added to disable retry limit
	},
	defaultJobOptions: {
		attempts: 3,
		backoff: {
			type: "exponential",
			delay: 2000,
		},
	},
});

const processAttachment = async (filePath) => {
	if (!filePath || typeof filePath !== "string") {
		logger.warn(`Invalid attachment path: ${JSON.stringify(filePath)}`);
		return null;
	}

	try {
		const absolutePath = path.isAbsolute(filePath)
			? path.normalize(filePath)
			: path.join(__dirname, "..", path.normalize(filePath));

		// Use asynchronous check for file existence
		try {
			await fs.promises.access(absolutePath, fs.constants.F_OK);
		} catch {
			logger.warn(`File not found: ${absolutePath}`);
			return null;
		}

		const fileContent = await fs.promises.readFile(absolutePath);
		const ext = path.extname(absolutePath).toLowerCase();

		return {
			filename: path.basename(absolutePath),
			content: fileContent.toString("base64"),
			encoding: "base64",
			contentType: CONFIG.mimeTypes[ext] || "application/octet-stream",
		};
	} catch (error) {
		logger.error(`Attachment processing error: ${filePath}`, error);
		return null;
	}
};

// Enhanced email content generation with modern UI
const generateEmailContent = (complaint, category, submittedDate) => {
	const details = [
		["Scholar Number", complaint.scholarNumber],
		["Student Name", complaint.studentName],
		["Stream", complaint.stream],
		["Year", complaint.year],
		["Department", complaint.department],
		["Hostel", complaint.hostelNumber],
		["Room", complaint.room],
		["Landmark", complaint.landmark],
		["Complaint Type", complaint.complainType],
		["Category", category],
		["Submitted On", submittedDate],
	].filter(([_, value]) => value);

	const baseTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    </head>
    <body style="
        margin: 0;
        padding: 0;
        background-color: ${CONFIG.colors.background};
        font-family: 'Inter', ${CONFIG.fonts.primary};
        line-height: 1.6;
        color: ${CONFIG.colors.text};
    ">
        <div style="
            max-width: 800px; /* Increased from 600px */
            margin: 20px auto;
            background-color: ${CONFIG.colors.cardBg};
            border-radius: 16px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        ">
            <!-- Modern Header with Gradient -->
            <header style="
                background: linear-gradient(135deg, ${
									CONFIG.colors.gradientStart
								} 0%, ${CONFIG.colors.gradientEnd} 100%);
                padding: ${CONFIG.spacing.xl};
                text-align: center;
                position: relative;
            ">
                <div style="
                    background: rgba(255, 255, 255, 0.1);
                    padding: ${CONFIG.spacing.md};
                    border-radius: 12px;
                    display: inline-block;
                    margin-bottom: ${CONFIG.spacing.md};
                ">
                    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQWhBHSMEY1Pa5xcGH5Pj2HLZOPlfyraJ0STQ&s" 
                         alt="MANIT Bhopal Logo" 
                         style="
                            width: 120px;
                            height: auto;
                            border-radius: 8px;
                            background: white;
                            padding: 8px;
                         "
                    />
                </div>
                <h1 style="
                    color: white;
                    margin: 0;
                    font-size: 28px;
                    font-weight: 700;
                    letter-spacing: -0.5px;
                ">
                    MANIT Complaint Management System
                </h1>
                <p style="
                    color: rgba(255, 255, 255, 0.9);
                    margin: ${CONFIG.spacing.sm} 0 0;
                    font-size: 16px;
                ">
                    Your Voice Matters
                </p>
            </header>

            <!-- Main Content Container -->
            <div style="padding: ${CONFIG.spacing.xl};">
                {{content}}
            </div>

            <!-- Modern Footer -->
            <footer style="
                background: linear-gradient(135deg, ${
									CONFIG.colors.gradientStart
								} 0%, ${CONFIG.colors.gradientEnd} 100%);
                padding: ${CONFIG.spacing.xl};
                text-align: center;
                color: white;
            ">
                <div style="max-width: 400px; margin: 0 auto;">
                    <h3 style="
                        margin: 0 0 ${CONFIG.spacing.sm};
                        font-size: 18px;
                        font-weight: 600;
                    ">Maulana Azad National Institute of Technology</h3>
                    <p style="
                        margin: 0 0 ${CONFIG.spacing.md};
                        font-size: 14px;
                        opacity: 0.9;
                    ">Link Road Number 3, Near Kali Mata Mandir,<br>Bhopal, Madhya Pradesh 462003</p>
                    <div style="
                        border-top: 1px solid rgba(255, 255, 255, 0.2);
                        padding-top: ${CONFIG.spacing.md};
                        margin-top: ${CONFIG.spacing.md};
                        font-size: 12px;
                        opacity: 0.8;
                    ">
                        &copy; ${new Date().getFullYear()} MANIT Complaint Portal. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    </body>
    </html>
    `;

	const content = `
        <div>
            <!-- Status Card -->
            <div style="
                background: linear-gradient(to right, ${
									CONFIG.colors.success
								}, #16a34a);
                border-radius: 12px;
                padding: ${CONFIG.spacing.lg};
                margin-bottom: ${CONFIG.spacing.xl};
                color: white;
                text-align: center;
            ">
                <div style="
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 50%;
                    width: 48px;
                    height: 48px;
                    margin: 0 auto ${CONFIG.spacing.md};
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                ">✓</div>
                <h2 style="
                    margin: 0 0 ${CONFIG.spacing.xs};
                    font-size: 24px;
                    font-weight: 700;
                ">Complaint Submitted Successfully</h2>
                <p style="
                    margin: 0;
                    font-size: 16px;
                    opacity: 0.9;
                ">
                    Complaint UID: <strong>${getCategoryTag(category)}${
		complaint._id
	}</strong>
                </p>
            </div>
            
            <!-- Personalized Greeting -->
            <div style="margin-bottom: ${CONFIG.spacing.xl};">
                <p style="
                    font-size: 18px;
                    margin: 0 0 ${CONFIG.spacing.md};
                ">
                    Dear <strong>${complaint.studentName}</strong>,
                </p>
                <p style="
                    color: ${CONFIG.colors.lightText};
                    margin: 0;
                    font-size: 16px;
                ">
                    Thank you for submitting your complaint. We have received your request and it will be reviewed by our team promptly.
                </p>
            </div>
            
            <!-- Details Card -->
            <div style="
                background: ${CONFIG.colors.background};
                border-radius: 12px;
                overflow: hidden;
                margin-bottom: ${CONFIG.spacing.xl};
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
                width: 100%;
            ">
                <div style="
                    background: ${CONFIG.colors.primary};
                    padding: ${CONFIG.spacing.md};
                    color: white;
                ">
                    <h3 style="
                        margin: 0;
                        font-size: 20px;
                        font-weight: 600;
                    ">Complaint Details</h3>
                </div>
                
                <div style="padding: ${CONFIG.spacing.lg};">
                    <table style="
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: ${CONFIG.spacing.lg};
                    ">
                        <tbody>
                            ${details
															.map(
																([key, value]) => `
                                <tr>
                                    <td style="
                                        padding: ${CONFIG.spacing.sm};
                                        border-bottom: 1px solid ${CONFIG.colors.border};
                                        font-weight: 600;
                                        color: ${CONFIG.colors.primary};
                                        width: 40%;
                                    ">${key}</td>
                                    <td style="
                                        padding: ${CONFIG.spacing.sm};
                                        border-bottom: 1px solid ${CONFIG.colors.border};
                                    ">${value}</td>
                                </tr>
                            `
															)
															.join("")}
                        </tbody>
                    </table>

                    <!-- Description Box -->
                    <div style="
                        background: white;
                        padding: ${CONFIG.spacing.lg};
                        border-radius: 8px;
                        border: 1px solid ${CONFIG.colors.border};
                    ">
                        <h4 style="
                            color: ${CONFIG.colors.primary};
                            margin: 0 0 ${CONFIG.spacing.sm};
                            font-size: 16px;
                            font-weight: 600;
                        ">Description</h4>
                        <p style="
                            margin: 0;
                            color: ${CONFIG.colors.text};
                            line-height: 1.6;
                        ">${complaint.complainDescription}</p>
                    </div>
                </div>
            </div>
            
            <!-- Next Steps Card -->
            <div style="
                background: #fff7ed;
                border: 1px solid ${CONFIG.colors.warning};
                border-radius: 8px;
                padding: ${CONFIG.spacing.lg};
                margin-bottom: ${CONFIG.spacing.lg};
            ">
                <h4 style="
                    color: ${CONFIG.colors.warning};
                    margin: 0 0 ${CONFIG.spacing.sm};
                    font-size: 16px;
                    font-weight: 600;
                ">What's Next?</h4>
                <ul style="
                    margin: 0;
                    padding-left: 20px;
                    color: #9a3412;
                ">
                    <li style="margin-bottom: ${
											CONFIG.spacing.xs
										}">Your complaint will be reviewed by the concerned department</li>
                    <li style="margin-bottom: ${
											CONFIG.spacing.xs
										}">You will receive updates on the status of your complaint</li>
                    <li>For urgent matters, please contact the department directly</li>
                </ul>
            </div>
        </div>
    `;

	return {
		html: baseTemplate.replace("{{content}}", content),
		text: `
MANIT Complaint Management System

Dear ${complaint.studentName},

Your complaint has been successfully submitted.
Complaint ID: #${complaint._id}

Complaint Details:
${details.map(([key, value]) => `${key}: ${value}`).join("\n")}

Description:
${complaint.complainDescription}

What's Next?
- Your complaint will be reviewed by the concerned department
- You will receive updates on the status of your complaint
- For urgent matters, please contact the department directly

Thank you for using the MANIT Complaint Portal.

MANIT Bhopal
Link Road Number 3, Near Kali Mata Mandir
Bhopal, Madhya Pradesh 462003
        `,
	};
};

// Email processor with enhanced error handling and input validation
const processor = async (job) => {
	const { email, subject, html, text, attachments } = job.data;

	// Validate essential email elements
	if (!email || !subject || !html || !text) {
		const errMsg = "Missing required email fields in job data.";
		logger.error(errMsg, job.data);
		throw new Error(errMsg);
	}

	try {
		await transporter.sendMail({
			from: process.env.EMAIL_USER,
			to: email,
			subject,
			html,
			text,
			attachments: attachments || [],
		});
		console.log("Email sent successfully\n");
		logger.info(`Email sent successfully to ${email}`);
	} catch (error) {
		logger.error(`Email sending failed to ${email}:`, error);
		throw new Error(`Email sending failed: ${error.message}`);
	}
};

emailQueue.process(processor);

// Main email automation function
export const automateEmail = async (data) => {
	const { category, complaint } = data;
	console.log("Automating the email into the job queue \n");
	if (!complaint) throw new Error("Complaint data is required");

	try {
		const processedAttachments = complaint.attachments?.length
			? (
					await Promise.all(complaint.attachments.map(processAttachment))
			  ).filter(Boolean)
			: [];

		const submittedDate = new Date(complaint.createdAt).toLocaleString(
			"en-IN",
			{
				dateStyle: "long",
				timeStyle: "short",
			}
		);

		const { html, text } = generateEmailContent(
			complaint,
			category,
			submittedDate
		);

		await emailQueue.add({
			email: complaint.useremail,
			subject: `[MANIT Complaints] New ${category} Complaint #${complaint._id} Submitted`,
			html,
			text,
			attachments: processedAttachments,
		});

		logger.info(`Email queued for complaint ${complaint._id}`);
	} catch (error) {
		logger.error("Email automation failed:", error);
		throw error;
	}
};

const getCategoryTag = (category) => {
	const map = {
		academic: "A",
		administration: "B",
		hostel: "C",
		infrastructure: "D",
		medical: "E",
		ragging: "F",
	};
	return map[category.toLowerCase()] || "";
};
