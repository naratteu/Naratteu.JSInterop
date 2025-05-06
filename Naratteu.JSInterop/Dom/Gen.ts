import { GenBlob } from "./GenUtil";
import { Project } from "ts-morph";
import { readdir } from "node:fs/promises";
import { from } from "linq-to-typescript";
import { $ } from "bun";

const libDomPath = require.resolve("typescript/lib/lib.dom.d.ts");
const sourceFile = new Project().addSourceFileAtPath(libDomPath);

function* print(itf: string) {
    const htmlInterface = sourceFile.getInterface(itf)!;
    for (const method of htmlInterface.getMethods()) {
        const returnType = method.getReturnType();
        const metName = method.getName();

        if (method.getParameters().length == 0 && returnType.isVoid())
            yield `public ValueTask ${metName}() => js.InvokeVoidAsync("${itf}.prototype.${metName}.call", Ref);`;
    }
}

const targets = from(await readdir(".")).selectMany((file) => {
    const name = /^(.+)\.t\.cs$/.exec(file)?.[1];
    return name ? [name] : [];
});
const genHere = new RegExp("/// <GenHere />.*");
const genEnd = new RegExp("/// <GenEnd />.*");
for (const className of targets) {
    const gen = async function* () {
        for await (let line of $`cat ./${className}.t.cs`.lines()) {
            switch (true) {
                case genHere.test(line):
                    const tab = line.replace(genHere, "");
                    for (const line of print(className)) yield tab + line;
                    break;
                case genEnd.test(line): return;
                default: yield line;
            }
        }
    };
    await $`cat < ${await GenBlob(gen)} | cat > ${className}.g.cs`;
}