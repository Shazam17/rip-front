const CURRENT_URL = "http://localhost:3001"

const fetchRequest = (
  address: string,
  body = {},
  headers: object,
  method = 'POST',
): Promise<any> => {
  return new Promise((resolve, reject) => {
    let bodyWrapper = {};
    if (method !== 'GET') {
      bodyWrapper = {body:JSON.stringify(body)};
    }
    fetch(`${CURRENT_URL}/${address}`, {
      headers: {
        ...headers,
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      method,
      ...bodyWrapper,
    })
      .then((res) => res.json().then((result) => {
        if(result?.success){
          resolve(result.data)
        }else{
          reject(result.error)
        }
      }))
      .catch((err) => reject(err));
  });
};

export default fetchRequest;
