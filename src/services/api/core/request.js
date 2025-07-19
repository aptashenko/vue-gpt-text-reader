import { createHttpClient } from './httpClient';

export const request = async (config, withAuth = true) => {
    const client = createHttpClient(withAuth);

    try {
        const response = await client.request(config);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};
