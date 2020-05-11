const generateMessage = (text,user) => {
    return {
        text,
        createdAt: new Date().getTime(),
        user
    }
}

const generateLocationMessage = (url) => {
    return {
        url,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}