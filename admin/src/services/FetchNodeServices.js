import axios from "axios";
const serverURL = "http://localhost:8000";
// const serverURL ="https://api.sddipl.com"

const postData = async (url, body) => {
  try {
    console.log(JSON.stringify(body));
    
    var response = await axios.post(`${serverURL}/${url}`, body);
    
    var data = response.data;
    return data;
  } catch (e) {
    return null;
  }
};

const getData = async (url) => {
  try {
    var response = await axios.get(`${serverURL}/${url}`);
    var data = response.data;
    return data;
  } catch (e) {
    return null;
  }
};

export { serverURL, postData, getData };
