FixArrays = function(arrayObject) {
  
  var temp = {};

   _.each(arrayObject , function(value, key, list) {
      if (value instanceof Array)
        if (value.length === 1)
          temp[key] = value[0];
        else
          temp[key] = value;
      else
          temp[key] = value;
  });
  
  return temp;
  
};