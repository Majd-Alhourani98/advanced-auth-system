const buildDatabaseURI = (username, password, dbname, baseURL) => {
  return baseURL.replace('<USERNAME>', username).replace('<PASSWORD>', password).replace('<DBNAME>', dbname);
};

export default buildDatabaseURI;
