// Use this code snippet in your app.
// If you need more information about configurations or implementing the sample code, visit the AWS docs:
// https://aws.amazon.com/developers/getting-started/nodejs/
import AWS from 'aws-sdk'

export const loadProcessEnvFromAWSSecrets = async () => {
    if(['development', 'qa'].includes(String(process.env.NODE_ENV).toLowerCase())){
        console.log(`Skipping environment variable set - environment is ${process.env.NODE_ENV}`)
        return 
    }

    // Create a Secrets Manager client
    var client = new AWS.SecretsManager({
        region: 'us-west-1',
    });

    // In this sample we only handle the specific exceptions for the 'GetSecretValue' API.
    // See https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
    // We rethrow the exception by default.

    return new Promise((resolve, reject) => {
        if(!process.env.SECRET_ID){
            throw new Error("Expected process.env.SECRET_ID but found none")
        }
        client.getSecretValue({SecretId: String(process.env.SECRET_ID)}, function(err, data) {
        if(err){
            reject(err)
        }
        if(!data.SecretString){throw new Error('Expected secretManager config but found none for the current environment')}

        const config = JSON.parse(data.SecretString)

        let setSecrets = 0 

        Object.keys(config).forEach((key) => {
            console.log({key: config[key]})
            if(!process.env[key]){
                process.env[key] = config[key]
                setSecrets += 1 
            }
        })

        console.log(`Set ${setSecrets}/${Object.keys(config).length} secrets as process.env variables.`)
        resolve()
    });
    }) 
}

if(!module.parent){
    loadProcessEnvFromAWSSecrets().then(() => {
        process.exit(0)
    })
}