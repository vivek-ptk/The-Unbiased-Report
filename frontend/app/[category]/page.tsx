import NewsHome from "../components/NewsHome";

export default async function CategoryPage({ params }: { params: { category: string } }) {
    
    return <NewsHome categoryParam={params.category || "Politics"} />;
  }
  