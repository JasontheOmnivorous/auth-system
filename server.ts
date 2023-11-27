import dotenv from "dotenv";
import app from "./index";
dotenv.config({ path: "./.env" });

const port = process.env.PORT || "";
app.listen(port, () => console.log(`Server listening at port ${port}...`));
