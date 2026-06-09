import Sqids from "sqids"

const CUSTOM_BASE_62 =
	"HChvB2F3wA0pm8exdMKyqJZgI1VGW9YkNzf46O7iQbXtlSnrsEouUPLRDTa5jc"

export const sqids = new Sqids({
	alphabet: CUSTOM_BASE_62,
})
