import NextAuth, { getServerSession } from 'next-auth'
import clientPromise from '../../../lib/mongodb';
import GoogleProvider from 'next-auth/providers/google';
import {MongoDBAdapter} from "@next-auth/mongodb-adapter";

const adminEmails= ['gabrieloteixeira113@gmail.com'];

export const authOption = {
  secret: process.env._SECRET,
  providers: [
    // OAuth authentication providers...

    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET
    }),
  ],
  adapter: MongoDBAdapter(clientPromise),
  callbacks: {
    session: ({session, token, profile}) => {
      if(adminEmails.includes(session?.user?.email)){
        return session;
      }
      else{
        return false;
      }
      
    },
  }
}
export default NextAuth(authOption);

export async function isAdminRequest(req,res){
  const session = await getServerSession(req, res, authOption);
  
  if(!adminEmails.includes(session?.user?.email)){
    res.status(401);
    res.end();
    throw 'Não é um admin';
  }
}