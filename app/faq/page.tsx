import Header from "../header";

export default function FAQ() {
  return (
    <>
      <Header />
      <div className="max-w-screen-sm mx-auto flex flex-col gap-4 py-12">
        <h1 className="text-2xl font-bold">FAQ</h1>
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold">What is fetch friends?</h2>
          <p>
            fetch friends is a platform that helps you find your furry friend.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold">How do I find my best friend?</h2>
          <p>
            You can find your best friend by searching for a breed and
            favoriting those you like. You can then use our matching feature to
            swipe through your favorites and see if you are a match.
          </p>
        </div>
      </div>
    </>
  );
}
