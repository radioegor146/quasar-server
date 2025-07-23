import {Logger} from "tslog";

export  function getLogger<T>(): Logger<T> {
    return new Logger<T>({
        type: "pretty",
        minLevel: process.argv.includes("--debug") ? 2 : 3
    });
}