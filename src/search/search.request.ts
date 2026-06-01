import z from "zod";

export const Search_Request = z.object({
  query: z.string(),
});


