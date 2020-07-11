export default function getMessagePrefixer(prefix) {
    return (inp) => {
        inp.message = `${prefix}${inp.message}`;
        return inp;
    };
}
