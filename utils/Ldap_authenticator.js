/**
 * @file LDAP Authenticator module.
 * @module utils/LdapAuthenticator
 */
import ldap from 'ldapjs';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Class representing an LDAP Authenticator.
 */
class LdapAuthenticator {
    /**
     * Create an LDAP Authenticator.
     * @param {string} baseDN - The base DN for LDAP.
     */
    constructor(baseDN) {
        this.baseDN = baseDN;
        this.client = ldap.createClient({
            url:  "ldap://172.31.171.59:389",
            tlsOptions: { rejectUnauthorized: false }
        });
        console.log("\nThis is the client of the ldap : " , this.client);
    }

    /**
     * Authenticate a user against the LDAP server.
     * @param {string} username - The username to authenticate.
     * @param {string} password - The password for the user.
     * @returns {Promise<boolean>} - A promise that resolves to true if authentication is successful, otherwise false.
     */
    async authenticate(username, password) {
        // Construct user DN dynamically
        const userDN = `uid=${username},ou=Students,${this.baseDN}`;

        return new Promise((resolve, reject) => {
            this.client.bind(userDN, password , (err) => {
                if (err) {
                    console.error("Bind error:", err.message);
                    this.client.unbind(); // Always unbind to clean up
                    return resolve(false); // Authentication failed
                }

                console.log("Authentication successful");
                this.client.unbind(); // Unbind after authentication
                return resolve(true); // Authentication successful
            });
        });
    }
}

export default LdapAuthenticator;
