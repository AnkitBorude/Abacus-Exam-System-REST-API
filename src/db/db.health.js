import mongoose from 'mongoose';

let getDbHealth = async () => {
    let database = {
        status: 'disconnected',
        health: 'unhealthy',
        responseTime: -1,
    };

    try {
        const start = Date.now();
        await mongoose.connection.db.admin().ping();
        const responseTime = Date.now() - start;

        database = {
            health: 'healthy',
            status: 'connected',
            responseTime: responseTime,
        };
    } catch (dbError) {
        database = {
            status: 'disconnected',
            health: 'unhealthy',
            error:dbError.message
        };
    }
    return database;
};
export default getDbHealth;
