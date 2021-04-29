const defaultModules = ['@sensoro/core', '@sensoro/layout', '@sensoro/library'];

//这个算法和umi-plugin-dynamic-module保持一致
function sourceFormatter(moduleName) {
  //统一处理成带/lib的形式,这里主要是为了统一
  let m = moduleName;
  const split = moduleName.split('/');
  if(split.length === 2 && split[0] === '@sensoro'){
    m = `${moduleName}/lib`
  }
  return `window.${m
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
        const dynamicModule = modules.some((module) =>
          node.source.value.startsWith(module),
        );
        if (!dynamicModule || !node) return;

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
