/**
 * logger config
 */
module.exports={
    appenders: { 
        out: { 
            type: 'stdout', 
            layout: { type: 'basic' }
        },
        file: {
            type: 'file', 
            filename: 'logs/system.log', 
            maxLogSize: 10485760, 
            backups: 3, 
            compress: true,
            layout: { type: 'basic' }   
        }
    },
    categories: { default: { appenders: ['file'], level: 'info' } }
};