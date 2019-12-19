#include <stdio.h>
#include <stdlib.h>
#include <string.h>

char *ptr[300];
char buffer[300][10];
int sortStudent(const void *a, const void *b) {
	char **pa = (char **)a;
	char **pb = (char **)b;
	return strcmp(*pa, *pb);
}
int findStudent(const void *lgn, const void *b) {
	char *target = (char *)lgn;
	char **pb = (char **)b;
	return strcmp(target, *pb);
}
int main(int argc, char *argv[]) {
	if (argc != 3) {
		printf("Usage: ./check authorityList gradeList > outputfile\n");
		return 0;
	}
	FILE *student = fopen(argv[1],"r");
	FILE *grade = fopen(argv[2], "r");
	int index = 0;
	while (fscanf(student, "%s", buffer[index]) != EOF) {
		ptr[index] = buffer[index];
		index++;
	}
	qsort(ptr, index, sizeof(ptr[0]), sortStudent);
#ifdef DEBUG
	for(int i = 0; i < index; i++)
		printf("%s\n", ptr[i]);
#endif
	char input[32];
	char lgn[16];
	int uid, score;
	fscanf(grade, "%s", input);
	printf("%s\n", input);
	while (fscanf(grade, "%s", input) != EOF) {
		char *split = strtok(input, ",\0");
		sscanf(split, "%d", &uid);
		split = strtok(NULL, ",\0");
		sscanf(split, "%s", lgn);
		split = strtok(NULL, ",\0");
		sscanf(split, "%d", &score);
		if (bsearch(lgn, ptr, index, sizeof(ptr[0]), findStudent) == NULL)
			score = 0;
		printf("%d,%s,%d\n", uid, lgn, score);
	}
	fclose(student);
	fclose(grade);
	return 0;
}
