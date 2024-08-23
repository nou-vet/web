const errorsDict = {
	"createPet.name.required": "Name is required",
	"createPet.name.length": "Name should not be too short or too long",
	"createPet.species": "Only acceptable species are allowed",
	"createPet.gender": "Incorrect gender is provided",
	"createPet.breed": "This breed name looks suspicious",
	"createPet.color": "Only valid colors are allowed",
	bday: "The day is not valid",
	bmonth: "The month is not valid",
	byear: "The year is not valid",
	"birthdate.range": "The birth date cannot be before 2000 or after today",
	"weight.range": "The wight cannot be negative or too big",
	"family.name": "Name cannot be empty",
	"user.name-min": "Name cannot be empty",
	"user.name-max": "Name cannot exceed 200 characters",
	"user.locale": "Locale is not supported",
	"user.measurementsSystem": "This measurements system is not supported",
	"deletePet.petId": "Pet ID is not provided",
	"deletePet.notFound": "Pet not found",
} as const;

export default errorsDict;
