import {Injectable,OnModuleInit,OnModuleDestroy} from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy,OnModuleInit{
    constructor(){
        super();
    }
    async onModuleDestroy() {
        await this.$connect();
    }
    async onModuleInit() {
        await this.$disconnect();
    }
}

