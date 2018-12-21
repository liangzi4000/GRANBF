const sql = require('mssql');
const config = require('./config.json');

module.exports = {
    CreateNextMBGAAccount: async function () {
        try {
            let pool = await new sql.ConnectionPool(config.dbconfig).connect();
            let result = await pool.request().execute('dbo.SP_CreateNextMBGAAccount');
            return result;
        } catch (err) {
            console.log(err);
            return null;
        }
    },
    CompleteMBGAAccount: async function (email) {
        try {
            let pool = await new sql.ConnectionPool(config.dbconfig).connect();
            await pool.request()
                .input('Email', sql.VarChar(100), email)
                .execute('dbo.SP_CompleteMBGAAccount');
        } catch (err) {
            console.log(err);
        }
    }
}

sql.on('error', err => {
    console.log(err);
})

/* How to use:
const db = require('./database');

(async () => {
    let result = await db.CreateNextMBGAAccount();
    console.log(result.recordset[0].Email);
})();
 */