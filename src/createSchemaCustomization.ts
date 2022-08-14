export default async function createSchemaCustomization({
	actions,
	schema,
}: any) {
	const { createTypes } = actions;

	// Ensure Published and Unpublished types exist even if there are no Nodes created with that type
	const typeDefs = `
		type Published implements Node @infer {
			id: ID!
			publishGroup: String!
		}
		type Unpublished implements Node @infer {
			id: ID!
			publishGroup: String!
		}
	`;
	createTypes(typeDefs);
}
