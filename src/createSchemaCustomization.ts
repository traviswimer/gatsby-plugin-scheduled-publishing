export default async function createSchemaCustomization({ actions }: any) {
	const { createTypes } = actions;
	const typeDefs = `
		type Published implements Node {
			id: ID!,
		}
		type Unpublished implements Node {
			id: ID!,
		}
	`;
	createTypes(typeDefs);
}
