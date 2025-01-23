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
    }

    /**
     * Create a new LDAP client.
     * @returns {ldap.Client} - The LDAP client.
     */
    createClient() {
        return ldap.createClient({
            url: "ldap://localhost:389",
            tlsOptions: { rejectUnauthorized: false }
        });
    }

    /**
     * Authenticate a user against the LDAP server.
     * @param {string} username - The username to authenticate.
     * @param {string} password - The password for the user.
     * @returns {Promise<boolean>} - A promise that resolves to true if authentication is successful, otherwise false.
     */
    async authenticate(username, password) {
        const client = this.createClient();
        // Construct user DN dynamically
        const userDN = `uid=${username},ou=Students,${this.baseDN}`;

        return new Promise((resolve, reject) => {
            client.bind(userDN, password , (err) => {
                if (err) {
                    console.error("Bind error:", err.message);
                    client.unbind(); // Always unbind to clean up
                    return resolve(false); // Authentication failed
                }

                console.log("Authentication successful");
                client.unbind(); // Unbind after authentication
                return resolve(true); // Authentication successful
            });
        });
    }
}

export default LdapAuthenticator;
