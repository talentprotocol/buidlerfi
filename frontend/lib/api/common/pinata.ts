import { TextOnlyMetadata } from "@lens-protocol/metadata";

import pinataSDK, { PinataPinResponse } from '@pinata/sdk';

export const uploadJSONToIPFS = async (name: string, object: TextOnlyMetadata): Promise<PinataPinResponse> => {
    const pinata = new pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_SECRET_API_KEY);
    const result = await pinata.pinJSONToIPFS(object, {pinataMetadata: {name}});
    return result;
}