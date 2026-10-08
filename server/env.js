import dotenv from 'dotenv';

// Hosting settings win over an imported local file. Tests supply their own
// environment and must never load live credentials from the developer's .env.
if (process.env.NODE_ENV !== 'test') dotenv.config({ override: false, quiet: true });
