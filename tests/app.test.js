const request = require("supertest");
const http = require("http");
const app = require("../index.js");

let server;

beforeAll(async () => {
  server = http.createServer(app);
  server.listen(3001);
});

afterAll(async () => {
  server.close();
});

describe("Travel Package API tests", () => {
  it("GET /packages should return all travel packages", async () => {
    const res = await request(server).get("/packages");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(15); 
  });

  it("GET /packages/:destination should return a travel package by destination", async () => {
    const res = await request(server).get("/packages/Paris");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      packageId: 1,
      destination: "Paris",
      price: 1500,
      duration: 7,
      availableSlots: 10,
    });
  });

  it("GET /packages/:destination should return 404 if destination not found", async () => {
    const res = await request(server).get("/packages/NotExist");
    expect(res.status).toBe(404);
    expect(res.text).toBe("No travel package found for destination: NotExist");
  });

  it("POST /bookings should create a new booking", async () => {
    const newBooking = {
      packageId: 2,
      customerName: "John Doe",
      bookingDate: "2025-01-01",
      seats: 2,
    };

    const res = await request(server).post("/bookings").send(newBooking);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("bookingId");
    expect(res.body.customerName).toBe(newBooking.customerName);
  });

  it("POST /packages/update-seats should update available seats for a package", async () => {
    const updateData = {
      packageId: 1,
      seatsBooked: 2,
    };

    const res = await request(server)
      .post("/packages/update-seats")
      .send(updateData);
    expect(res.status).toBe(200);
    expect(res.body.availableSlots).toBe(8); 
  });

  it("POST /packages/update-seats should return 400 for invalid packageId", async () => {
    const updateData = {
      packageId: 999, 
      seatsBooked: 2,
    };

    const res = await request(server)
      .post("/packages/update-seats")
      .send(updateData);
    expect(res.status).toBe(400);
    expect(res.text).toBe("Invalid packageId: 999");
  });

  it("GET /bookings/:packageId should return all bookings for a package", async () => {
    const res = await request(server).get("/bookings/1");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      {
        bookingId: 1,
        packageId: 1,
        customerName: "Anjali Seth",
        bookingDate: "2024-12-01",
        seats: 2,
      },
    ]);
  });
});
