import Hashids from "hashids";

// Pick a secret salt (keep it safe, like an env variable)
const SALT = process.env.HASHIDS_SALT || "super-secret-salt";
const MIN_LENGTH = 10; // optional: enforce minimum encoded length

const hashids = new Hashids(SALT, MIN_LENGTH);

export function encodeId(id) {
  return hashids.encode(Number(id));
}

export function decodeId(encoded) {
  const decoded = hashids.decode(encoded);
  return decoded.length > 0 ? decoded[0] : null;
}
