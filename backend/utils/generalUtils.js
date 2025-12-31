import pinata from "../config/pinata.js";
import {
  ART,
  BUFFER_MIME_PREFIXES,
  BUFFER_MIME_TYPES,
  FINANCE,
  TECHNICAL,
} from "../constants/constants.js";

const TechnicalGroupId = process.env.TECHNICAL_GROUP_ID;
const ArtGroupId = process.env.ART_GROUP_ID;
const FinanceGroupId = process.env.FINANCE_GROUP_ID;
const pinataUrl = process.env.PINATA_GROUP_URL;
export const groupNameToId = (name) => {
  if (name == TECHNICAL) return TechnicalGroupId;
  else if (name == ART) return ArtGroupId;
  else if (name == FINANCE) return FinanceGroupId;
};

const shouldBuffer = (type) => {
  return (
    BUFFER_MIME_PREFIXES.some((p) => type.startsWith(p)) ||
    BUFFER_MIME_TYPES.includes(type)
  );
};
const fetchFileBuffer = async (cid) => {
  // console.log(cid);
  const { data, contentType } = await pinata.gateways.public.get(cid);

  if (shouldBuffer(contentType)) {
    const arrayBuffer = await data.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return {
      type: contentType,
      cid: cid,
      data: buffer,
    };
  } else
    return {
      type: contentType,
      cid: cid,
      data: data,
    };
};

export async function getFilesByGroup(groupId) {
  const url = `${pinataUrl}?groupId=${groupId}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.PINATA_JWT}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Pinata error ${res.status}`);
  }

  const data = await res.json();
  return data.rows;
}

export async function getFileBuffers(cids) {
  const buffers = await Promise.all(
    cids.map((cid) => {
      return fetchFileBuffer(cid); // here becase I am using {} so need a retuurn statement here explicitly
      // but with no {} just writing fetchFileBuffer is okay
    })
  );

  return buffers;
}
