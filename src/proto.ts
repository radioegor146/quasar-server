import protobuf, {Root} from "protobufjs";
import path from "node:path";

export function loadProto(protoPath: string): Root {
    const protoDirectoryRoot = path.join(process.cwd(), "protos");
    const root = new Root();
    root.resolvePath = function (origin: string, target: string) {
        if (path.isAbsolute(target)) {
            return target;
        }
        return path.join(protoDirectoryRoot, target);
    }
    root.loadSync(path.join(protoDirectoryRoot, protoPath));
    return root;
}