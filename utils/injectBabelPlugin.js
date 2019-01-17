const getLoader = (rules, matcher) => {
  let loader

  rules.some(rule => {
    return (loader = matcher(rule)
      ? rule
      : getLoader(
          rule.use || rule.oneOf || (Array.isArray(rule.loader) && rule.loader) || [],
          matcher
        ))
  })

  return loader
}

const getBabelLoader = rules => {
  return getLoader(rules, babelLoaderMatcher)
}

export const injectBabelPlugin = (pluginName, config) => {
  const loader = getBabelLoader(config.module.rules)
  if (!loader) {
    console.log('babel-loader not found')
    return config
  }
  // Older versions of webpack have `plugins` on `loader.query` instead of `loader.options`.
  const options = loader.options || loader.query
  options.plugins = [pluginName].concat(options.plugins || [])
  return config
}
