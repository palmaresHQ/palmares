class EventsServer {
  async listen(callback: () => void) {
    callback();
    setInterval(() => {
      return;
    }, 1 << 30);
  }
}

export default function eventsServer() {
  return new EventsServer();
}
