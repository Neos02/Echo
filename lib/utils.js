export function readFile(filePath) {
	let xhr = new XMLHttpRequest();

  return new Promise((resolve, reject) => {
			xhr.onreadystatechange = () => {
					if(xhr.readyState !== 4) return;

					if(xhr.status === 200 || xhr.status === 0) {
							resolve(xhr.responseText);
					}
			}

			xhr.open("GET", filePath, true);
			xhr.send(null);
	});
}

export function inferType(object) {
  try {
    // Numbers
    let num = +object;
    if(!isNaN(num)) {
      return num;
    }

    // Parse booleans
    if(object == 'true' || object == 'false') {
      return object == 'true';
    }

    // Parse objects and arrays
    let parsed = eval(`JSON.parse(JSON.stringify(${object}))`);
    if(parsed) {
      return parsed;
    }
  } catch(e) {
    // If string cannot be parsed, return original string
    return object;
  }
}
