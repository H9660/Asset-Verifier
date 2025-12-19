import { PinataSDK } from "pinata";
import { configDotenv } from "dotenv";
configDotenv();
const pinataJWT = process.env.PINATA_JWT;
const gateway = process.env.PINATA_GATEWAY_URL;
const pinata = new PinataSDK({
  pinataJwt: pinataJWT,
  pinataGateway: gateway,
});

export default pinata;
