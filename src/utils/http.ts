import axios, { AxiosInstance } from "axios";

export function makeHttp(baseURL: string): AxiosInstance {
  return axios.create({
    baseURL,
    timeout: 15_000,
    headers: { Accept: "application/json" },
  });
}
