import { Hono } from "hono";
import { PrismaClient } from "../generated/prisma/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { sign, verify } from "hono/jwt";

const v1routes = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
  Variables: {
    user: any;
  };
}>();

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL || "",
}).$extends(withAccelerate());

v1routes.use("/blog/*", async (c, next) => {
  const token = c.req.header("Authorization")?.replace("Bearer ", "");
  console.log("Token from middleware:", token);
  if (!token) {
    return c.text("Unauthorized", 401);
  }
  try {
    const decoded = await verify(token, c.env.JWT_SECRET);
    console.log("decoded from middleware:", decoded);
    c.set("user", decoded);
  } catch (error) {
    return c.text("Invalid token", 401);
  }
  await next();
});

v1routes.post("/sign-up", async (c) => {
  const { name, email, password } = await c.req.json();
  console.log("Sign-up data:", { name, email, password });
  try {
    const user = await prisma.user.create({
      data: {
        name: name as string,
        email: email as string,
        passrord: password as string,
      },
    });
    const token = await sign(user, c.env.JWT_SECRET);
    return c.json({
      res: user,
      token,
    });
  } catch (error) {
    return c.json({
      error: "Error during sign-up",
      details: error,
    });
  }
});

v1routes.post("/sign-in", async (c) => {
  const { email, password } = await c.req.json();
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email as string,
      },
    });
    if (user) {
      if (user.passrord === password) {
        const token = await sign(user, c.env.JWT_SECRET);
        return c.json({
          res: user,
          token,
        });
      } else {
        return c.text("Invalid password", 401);
      }
    }
  } catch (error) {
    return c.text("Error during sign-in", 500);
  }
  return c.text("Hello from v1 routes!");
});
v1routes.post("/blog", async (c) => {
  const user = c.get("user");
  const { title, content, published } = await c.req.json();
  try {
    const blog = await prisma.post.create({
      data: {
        title: title as string,
        content: content as string,
        published: published as boolean,
        authorId: user.id,
      },
    });
    return c.json({
      res: blog,
    });
  } catch (error) {
    return c.json({
      error: "Error creating blog post",
      details: error,
    });
  }
});

v1routes.put("/blog", async (c) => {
  const user = c.get("user");
  const { title, content, published, id } = await c.req.json();
  try {
    const blog = await prisma.post.update({
      where: {
        id: id as string,
        authorId: user.id,
      },
      data: {
        title: title as string,
        content: content as string,
      },
    });
    return c.json({
      res: blog,
    });
  } catch (error) {
    return c.json({
      error: "Error creating blog post",
      details: error,
    });
  }
});

v1routes.get("/blog/:id", (c) => {
  const id = c.req.param("id");
  try {
    const blog = prisma.post.findUnique({
      where: {
        id: id as string,
      },
    });
    if (blog) {
      return c.json({
        res: blog,
      });
    } else {
      return c.text("Blog post not found", 404);
    }
  } catch (error) {
    return c.json({
      error: "Error fetching blog post",
      details: error,
    });
  }
});

v1routes.get("/blog/bulk", async (c) => {
  try {
    const blogs = await prisma.post.findMany();
    return c.json({
      res: blogs,
    });
  } catch (error) {
    return c.json({
      error: "Error fetching blog posts",
      details: error,
    });
  }
});

export default v1routes;
