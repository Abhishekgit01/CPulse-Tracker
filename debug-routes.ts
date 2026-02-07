import router from "./src/routes/auth";

const routes = (router as any).stack
  .filter((layer: any) => layer.route)
  .map((layer: any) => ({
    path: layer.route.path,
    methods: Object.keys(layer.route.methods),
  }));

console.log("Auth routes:", JSON.stringify(routes, null, 2));
