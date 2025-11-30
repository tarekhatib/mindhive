const app = require("./app");
const dotenv = require("dotenv");
const swaggerDocs = require("./swagger");

dotenv.config();

swaggerDocs(app);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
