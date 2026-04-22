function decodeProtobufFieldValue(value: any): any {
    if ("structValue" in value) {
        console.info(value)
        return decodeProtobufStruct(value.structValue);
    }
    if ("stringValue" in value) {
        return value.stringValue;
    }
    if ("nullValue" in value) {
        return null;
    }
    if ("boolValue" in value) {
        return !!value.boolValue;
    }
    if ("listValue" in value) {
        return value.listValue.values.map((item: any) => decodeProtobufFieldValue(item))
    }
    if ("numberValue" in value) {
        return value.numberValue;
    }
    throw new Error(`wut? ${JSON.stringify(value)}`)
}

export function decodeProtobufStruct(value: any): any {
    const result: Record<string, any> = {};
    for (const [key, field] of Object.entries(value.fields)) {
        const value = decodeProtobufFieldValue(field);
        result[key] = value;
    }
    return result;
}