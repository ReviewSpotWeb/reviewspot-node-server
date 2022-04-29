import axios from "axios";

// Given options (Object) to be used to send a request to an external resourcs (e.g., API),
// use axios to send the request. Request options **at minimum** should have a
// method field (e.g., GET, POST, etc.) and a url to send the request to.
// This function returns a pair of (data, error). On success, the function will return
// (data, null), and on error
export const getDataFromRequest = async (requestOptions) => {
    try {
        const response = await axios(requestOptions);
        const data = response.data;
        return [data, null];
    } catch (error) {
        return [null, error];
    }
};
