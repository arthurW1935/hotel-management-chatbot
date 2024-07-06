const axios = require('axios');

const getRoomOptions = async () => {
    const response = await axios.get('https://bot9assignement.deno.dev/rooms');
    return response.data;
};

const bookRoom = async (roomId, fullName, email, nights) => {
    const response = await axios.post('https://bot9assignement.deno.dev/book', {
        roomId, fullName, email, nights
    });
    return response.data;
};

module.exports = { getRoomOptions, bookRoom };
