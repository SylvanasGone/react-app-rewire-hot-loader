function rewireHotLoader(config, env) {
  if (env === 'production') {
    return config
  }

  const getLoader = function(rules, matcher) {
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

  const babelLoader = getLoader(
    config.module.rules,
    rule => rule.loader && typeof rule.loader === 'string' && rule.loader.includes('babel-loader')
  )

  if (!babelLoader) {
    console.log('babel-loader not found')
    return config
  }

  // Find a rule which contains eslint-loader
  const condition = u => typeof u === 'object' && u.loader && u.loader.includes('eslint-loader')
  const rule = config.module.rules.find(rule => rule.use && rule.use.some(condition))

  if (rule) {
    const use = rule.use.find(condition)

    if (use) {
      // Inject the option for eslint-loader
      use.options.emitWarning = true
    }
  }

  const options = babelLoader.options || babelLoader.query
  options.plugins = ['react-hot-loader/babel'].concat(options.plugins || [])

  return config
}

module.exports = rewireHotLoader
