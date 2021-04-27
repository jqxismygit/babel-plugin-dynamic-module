const defaultModules = ['@sensoro/core', '@sensoro/layout', '@sensoro/library'];

//这个算法和umi-plugin-dynamic-module保持一致
function sourceFormatter(moduleName) {
  return `window.${moduleName
    .replace(/\@/g, '')
    .replace(/\//g, '$')
    .replace(/\-/g, '$')}`;
}

export default function ({ types, template }) {
  return {
    name: 'babel-plugin-dynamic-module',
    visitor: {
      ImportDeclaration(path, state) {
        const { node } = path;
        const { opts } = state;
        const { modules = defaultModules } = opts;
        // path maybe removed by prev instances.
        if (modules.indexOf(node.source.value) === -1 || !node) return;

        const source = sourceFormatter(node.source.value);
        //导出的默认
        let defaultNameSpaceExport;
        let exports = [];
        node.specifiers.forEach((specifier) => {
          if (specifier.type === 'ImportSpecifier') {
            if (
              specifier.imported.name === 'default' &&
              specifier.imported.name !== specifier.local.name
            ) {
              // defaultExport = specifier.local.name;
              exports.push({
                imported: 'default',
                local: specifier.local.name,
              });
            } else if (specifier.imported.name !== specifier.local.name) {
              exports.push({
                imported: specifier.imported.name,
                local: specifier.local.name,
              });
            } else {
              exports.push(specifier.local.name);
            }
          } else if (specifier.type === 'ImportDefaultSpecifier') {
            // defaultExport = specifier.local.name;
            exports.push({
              imported: 'default',
              local: specifier.local.name,
            });
          } else if (specifier.type === 'ImportNamespaceSpecifier') {
            // exports.push(specifier.local.name);
            defaultNameSpaceExport = specifier.local.name;
          }
        });

        let sourceString = '';
        if (defaultNameSpaceExport) {
          sourceString = `const ${defaultNameSpaceExport} = ${source};`;
        }
        if (exports.length > 0) {
          sourceString += `const {`;
          exports.forEach((element) => {
            if (typeof element === 'object') {
              sourceString += `${element.imported}:${element.local},`;
            } else {
              sourceString += `${element},`;
            }
          });
          sourceString += `} = ${source}`;
        }
        const ast = template.ast(sourceString);

        path.replaceWithMultiple(ast);
      },
    },
  };
}
