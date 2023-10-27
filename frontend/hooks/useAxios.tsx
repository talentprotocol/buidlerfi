import { usePrivy } from "@privy-io/react-auth";
import axios from "axios";
import { useMemo } from "react";

function dateTransformer(data: object): object {
  // Check if a string looks like a date
  function isDateString(value: unknown): value is string {
    const dateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(.\d{3}Z?)?)?$/;
    return typeof value === "string" && dateRegex.test(value);
  }

  // Recursive function to traverse and transform the data
  function transform(obj: object | object[]): object | object[] {
    if (Array.isArray(obj)) {
      return obj.map(item => transform(item));
    } else if (typeof obj === "object" && obj !== null) {
      const transformedObj: Record<string, unknown> = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          transformedObj[key] = isDateString(obj[key as keyof typeof obj])
            ? new Date(obj[key as keyof typeof obj])
            : transform(obj[key as keyof typeof obj]);
        }
      }
      return transformedObj;
    } else {
      return obj;
    }
  }

  return transform(data);
}

export const useAxios = () => {
  const { getAccessToken } = usePrivy();

  const axiosInstance = useMemo(() => {
    const instance = axios.create();

    const axiosTransformers = (() => {
      if (!axios.defaults.transformResponse) return [dateTransformer];
      if (Array.isArray(axios.defaults.transformResponse))
        return [...axios.defaults.transformResponse, dateTransformer];
      else return [axios.defaults.transformResponse, dateTransformer];
    })();

    instance.defaults.transformResponse = axiosTransformers;

    instance.interceptors.request.use(async config => {
      const token = await getAccessToken();

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    });

    // instance.interceptors.response.use(
    //   response => {
    //     return response;
    //   },
    //   error => {
    //     toast.error(error.response?.data?.error || error.message);
    //     return Promise.reject(error);
    //   }
    // );

    return instance;
  }, [getAccessToken]);

  return axiosInstance;
};
