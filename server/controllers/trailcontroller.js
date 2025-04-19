var connection = require('../models/db')

const auditTrail =()=> {

}
  

auditTrail.log = (trail)=>{
    connection.query(`insert into trail (actor,action,type) values ('${trail.actor}', ('${trail.action}', ('${trail.type }')`, (err,resp)=>{

        if(err){
            console.log(err)
        }
    })

}

module.exports = auditTrail