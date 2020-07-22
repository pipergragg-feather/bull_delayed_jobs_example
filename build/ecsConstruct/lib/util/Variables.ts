export class Variables {
    public static environment(){
        return process.env.DEPLOY_ENV || "qa";
    }

    public static withSuffix(name: string): string{
        return `${name}-${this.environment()}`
    }

    public static region(){
        return 'us-west-1'
    }
}