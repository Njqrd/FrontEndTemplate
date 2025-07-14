import Card from "@/components/poker/Card";

const HomePage = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Poker Trainer</h1>
      <p className="mb-8">Welcome to the best place to improve your Texas Hold'em skills.</p>
      
      <h2 className="text-2xl font-bold mb-4">Card Examples</h2>
      <div className="flex space-x-4">
        <Card suit="hearts" rank="A" faceUp />
        <Card suit="spades" rank="K" faceUp />
        <Card suit="clubs" rank="7" faceUp={false} />
      </div>
    </div>
  );
};

export default HomePage;
