const defaultModules = ['@sensoro/core', '@sensoro/layout', '@sensoro/library'];

function sourceFormatter(moduleName) {
  return `window._${moduleName.replace(/\@/g, '').replace(/\//g, '')}_`;
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
        let defaultExport;
        let exports = [];
        node.specifiers.forEach((specifier) => {
          if (specifier.type === 'ImportSpecifier') {
            if (
              specifier.imported.name === 'default' &&
              specifier.imported.name !== specifier.local.name
            ) {
              defaultExport = specifier.local.name;
            } else if (specifier.imported.name !== specifier.local.name) {
              exports.push({
                imported: specifier.imported.name,
                local: specifier.local.name,
              });
            } else {
              exports.push(specifier.local.name);
            }
          } else if (
            specifier.type === 'ImportDefaultSpecifier' ||
            specifier.type === 'ImportNamespaceSpecifier'
          ) {
            defaultExport = specifier.local.name;
          }
        });

        let sourceString = '';
        if (defaultExport) {
          sourceString = `const ${defaultExport} = ${source};`;
        }
        if (exports.length > 0) {
          sourceString += `const {`;
          exports.forEach((element) => {
            if (typeof element === 'object') {
              sourceString += `${element.imported}:${element.local}`;
            } else {
              sourceString += `${element},`;
            }
          });
          sourceString += `} = ${defaultExport ? defaultExport : source}`;
        }
        const ast = template.ast(sourceString);

        if (defaultExport && exports.length > 0) {
          path.replaceWithMultiple(ast);
        } else {
          path.replaceWith(ast);
        }
      },
    },
  };
}
