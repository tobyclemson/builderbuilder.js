var bb = bb || {};

bb.builder = function(attributeDefinitions, factoryFunction) {
  var builderState = {};
  _.each(attributeDefinitions, function(def) {
    var attributeName = def.attributeName;
    var valueTransformer = def.suppliedValueTransformer;
    var defaultValueGenerator;
    
    if (def.defaultValueGenerator) {
      defaultValueGenerator = def.defaultValueGenerator;
    } else if(def.defaultValueBuilder) {
      defaultValueGenerator = scms.test.generators.builderAdapterGenerator(def.defaultValueBuilder);
    } else {
      var defaultValue = def.defaultValue;
      var transformedDefaultValue = valueTransformer ? valueTransformer(defaultValue) : defaultValue;
      defaultValueGenerator = scms.test.generators.constantValueGenerator(transformedDefaultValue);
    } 
  
    builderState[attributeName] = defaultValueGenerator;
  });
  
  return function() {
    var state = _.reduce(builderState, function(currentState, defaultValueGenerator, attributeName) {
      currentState[attributeName] = defaultValueGenerator.next();
      return currentState;
    }, {});
    var builderMethods = {};
    var defaultedFactoryFunction = factoryFunction || function(state) {
      return state;
    };
    
    _.each(attributeDefinitions, function(def) {
      var attributeName = def.attributeName;
      var valueTransformer = def.suppliedValueTransformer;
    
      builderMethods[attributeName] = function(value) {
        state[attributeName] = valueTransformer ? valueTransformer(value) : value;
        return this;
      }
    });
    
    return _.extend({}, builderMethods, {
      build: function() {
        return defaultedFactoryFunction(state);
      }
    });
  }
};
