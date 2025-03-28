import session from "express-session";
import Keycloak from "keycloak-connect";
import https from "https";
import "dotenv/config";
import MongoStore from "connect-mongo";

// Get your MongoDB connection string from an environment variable
const mongoUrl = process.env.MONGO_URI; // e.g., "mongodb://username:password@host:port/database"

// Create a MongoDB session store
const memoryStore = MongoStore.create({
	mongoUrl: mongoUrl,
	// Optional: specify additional options like collection name and TTL (time-to-live) for sessions
	collectionName: "sessions",
	ttl: 14 * 24 * 60 * 60, // 14 days in seconds
});

const httpsAgent = new https.Agent({
	rejectUnauthorized: false, // Ignore self-signed SSL errors
});

// Create session configuration
const sessionConfig = session({
	secret: process.env.SESSION_SECRET || "complainPortalSecretKey",
	resave: false,
	saveUninitialized: true,
	store: memoryStore,
	cookie: {
		maxAge: 1000 * 60 * 60 * 24, // 24 hours
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
	},
});

const keycloak = new Keycloak(
	{ store: memoryStore },
	{
		realm: process.env.KEYCLOAK_REALM,
		"auth-server-url": process.env.KEYCLOAK_AUTH_SERVER_URL,
		"ssl-required": "external",
		resource: process.env.KEYCLOAK_CLIENT_ID,
		"public-client": false,
		"confidential-port": 0,
		backchannelLogout: true,
		idpLogout: true,
		credentials: {
			secret: process.env.KEYCLOAK_CLIENT_SECRET,
		},
		"http-agent": httpsAgent,
	}
);

export { keycloak, memoryStore, sessionConfig };
